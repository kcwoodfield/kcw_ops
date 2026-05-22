using KcwOps.Api.Features.Auth.Login;
using KcwOps.Api.Features.Auth.Refresh;
using KcwOps.Api.Features.Auth.Setup;
using KcwOps.Api.Features.Auth.Verify;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace KcwOps.Api.Features.Auth;

[ApiController]
[Route("auth")]
public class AuthController(IMediator mediator, IWebHostEnvironment env) : ControllerBase
{
    private const string RefreshCookie = "kcw_refresh";

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(body.Username, body.Password), ct);
        if (!result.RequiresMfa)
            return Unauthorized(new { error = "Invalid credentials." });

        return Ok(new { requiresMfa = true, tempToken = result.TempToken });
    }

    [HttpPost("verify")]
    [EnableRateLimiting("auth")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify([FromBody] VerifyRequest body, CancellationToken ct)
    {
        var result = await mediator.Send(new VerifyCommand(body.TempToken, body.TotpCode), ct);
        if (!result.Success)
            return Unauthorized(new { error = "Invalid or expired code." });

        SetRefreshCookie(result.RefreshToken!);
        return Ok(new { accessToken = result.AccessToken });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies[RefreshCookie];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized();

        var result = await mediator.Send(new RefreshCommand(refreshToken), ct);
        if (!result.Success)
        {
            ClearRefreshCookie();
            return Unauthorized();
        }

        SetRefreshCookie(result.RefreshToken!);
        return Ok(new { accessToken = result.AccessToken });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public IActionResult Logout()
    {
        ClearRefreshCookie();
        return NoContent();
    }

    [HttpPost("setup")]
    [AllowAnonymous]
    public async Task<IActionResult> Setup([FromBody] SetupRequest body, CancellationToken ct)
    {
        if (!env.IsDevelopment())
            return NotFound();

        var result = await mediator.Send(new SetupCommand(body.Password), ct);
        return Ok(result);
    }

    private void SetRefreshCookie(string token) =>
        Response.Cookies.Append(RefreshCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !Request.Host.Host.Contains("localhost"),
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/auth/refresh",
        });

    private void ClearRefreshCookie() =>
        Response.Cookies.Delete(RefreshCookie, new CookieOptions { Path = "/auth/refresh" });
}
