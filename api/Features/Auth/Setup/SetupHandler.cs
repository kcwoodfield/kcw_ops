using MediatR;
using OtpNet;

namespace KcwOps.Api.Features.Auth.Setup;

public class SetupHandler : IRequestHandler<SetupCommand, SetupResult>
{
    public Task<SetupResult> Handle(SetupCommand cmd, CancellationToken ct)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(cmd.Password, workFactor: 12);

        var secretBytes = KeyGeneration.GenerateRandomKey(20);
        var secret = Base32Encoding.ToString(secretBytes);
        var uri = $"otpauth://totp/kcw-ops:kcw?secret={secret}&issuer=kcw-ops";

        return Task.FromResult(new SetupResult(hash, secret, uri));
    }
}
