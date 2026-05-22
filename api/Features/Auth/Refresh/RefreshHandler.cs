using System.Security.Claims;
using MediatR;

namespace KcwOps.Api.Features.Auth.Refresh;

public class RefreshHandler(TokenService tokens) : IRequestHandler<RefreshCommand, RefreshResult>
{
    public Task<RefreshResult> Handle(RefreshCommand cmd, CancellationToken ct)
    {
        var principal = tokens.ValidateToken(cmd.RefreshToken);
        if (principal is null)
            return Task.FromResult(new RefreshResult(false, null, null));

        var typeClaim = principal.FindFirstValue("type");
        if (typeClaim != "refresh")
            return Task.FromResult(new RefreshResult(false, null, null));

        var username = principal.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var newAccess = tokens.IssueAccessToken(username);
        var newRefresh = tokens.IssueRefreshToken(username);

        return Task.FromResult(new RefreshResult(true, newAccess, newRefresh));
    }
}
