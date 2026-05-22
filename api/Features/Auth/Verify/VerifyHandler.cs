using System.Security.Claims;
using MediatR;
using Microsoft.Extensions.Options;
using OtpNet;

namespace KcwOps.Api.Features.Auth.Verify;

public class VerifyHandler(IOptions<AuthSettings> opts, TokenService tokens)
    : IRequestHandler<VerifyCommand, VerifyResult>
{
    private readonly AuthSettings _s = opts.Value;

    public Task<VerifyResult> Handle(VerifyCommand cmd, CancellationToken ct)
    {
        var principal = tokens.ValidateToken(cmd.TempToken);
        if (principal is null)
            return Task.FromResult(new VerifyResult(false, null, null));

        var mfaClaim = principal.FindFirstValue("mfa");
        if (mfaClaim != "pending")
            return Task.FromResult(new VerifyResult(false, null, null));

        var secretBytes = Base32Encoding.ToBytes(_s.TotpSecret);
        var totp = new Totp(secretBytes);
        var valid = totp.VerifyTotp(cmd.TotpCode, out _, new VerificationWindow(1, 1));

        if (!valid)
            return Task.FromResult(new VerifyResult(false, null, null));

        var username = principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var accessToken = tokens.IssueAccessToken(username);
        var refreshToken = tokens.IssueRefreshToken(username);

        return Task.FromResult(new VerifyResult(true, accessToken, refreshToken));
    }
}
