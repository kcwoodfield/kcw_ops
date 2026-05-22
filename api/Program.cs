using System.IdentityModel.Tokens.Jwt;
using System.Text;
using FluentValidation;
using KcwOps.Api.Features.Auth;
using KcwOps.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;

// Prevent .NET from remapping JWT claim names (sub → nameidentifier, etc.)
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// ── Auth config ───────────────────────────────────────────────────────────────
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));
builder.Services.AddSingleton<TokenService>();

var jwtSecret = builder.Configuration["Auth:JwtSecret"] ?? "";
var jwtIssuer = builder.Configuration["Auth:JwtIssuer"] ?? "kcw-ops";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ── Rate limiting (auth endpoints: 10 req / 15 min per IP) ───────────────────
builder.Services.AddRateLimiter(opts =>
{
    opts.AddFixedWindowLimiter("auth", o =>
    {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromMinutes(15);
        o.QueueLimit = 0;
        o.AutoReplenishment = true;
    });
    opts.RejectionStatusCode = 429;
});

// ── CORS (origin from env, fallback to localhost for dev) ────────────────────
var allowedOrigin = builder.Configuration["AllowedOrigin"] ?? "http://localhost:5175";
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(p => p
        .WithOrigins(allowedOrigin)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

// ── App services ──────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// ── Pipeline ──────────────────────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DataSeeder.SeedAsync(db);
}

app.Run();
