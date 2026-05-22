using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace KcwOps.Api.Features.Auth;

public class TokenService(IOptions<AuthSettings> opts)
{
    private readonly AuthSettings _s = opts.Value;

    private SigningCredentials Credentials()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_s.JwtSecret));
        return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string IssueAccessToken(string username)
    {
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, username) };
        var token = new JwtSecurityToken(
            issuer: _s.JwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_s.JwtExpiryMinutes),
            signingCredentials: Credentials()
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string IssueTempToken(string username)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim("mfa", "pending"),
        };
        var token = new JwtSecurityToken(
            issuer: _s.JwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_s.TempTokenExpiryMinutes),
            signingCredentials: Credentials()
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string IssueRefreshToken(string username)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim("type", "refresh"),
        };
        var token = new JwtSecurityToken(
            issuer: _s.JwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(_s.RefreshExpiryDays),
            signingCredentials: Credentials()
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_s.JwtSecret));
        try
        {
            return new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _s.JwtIssuer,
                ValidateAudience = false,
                ValidateLifetime = validateLifetime,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero,
            }, out _);
        }
        catch
        {
            return null;
        }
    }
}
