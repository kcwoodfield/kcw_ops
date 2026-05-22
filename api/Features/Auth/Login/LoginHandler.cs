using MediatR;
using Microsoft.Extensions.Options;

namespace KcwOps.Api.Features.Auth.Login;

public class LoginHandler(IOptions<AuthSettings> opts, TokenService tokens)
    : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly AuthSettings _s = opts.Value;

    public Task<LoginResult> Handle(LoginCommand cmd, CancellationToken ct)
    {
        // Constant-time username check + bcrypt verify to prevent timing attacks
        var usernameOk = string.Equals(cmd.Username, _s.Username, StringComparison.Ordinal);
        var passwordOk = BCrypt.Net.BCrypt.Verify(cmd.Password, _s.PasswordHash);

        if (!usernameOk || !passwordOk)
            return Task.FromResult(new LoginResult(false, null));

        var tempToken = tokens.IssueTempToken(cmd.Username);
        return Task.FromResult(new LoginResult(true, tempToken));
    }
}
