using MediatR;

namespace KcwOps.Api.Features.Auth.Setup;

public record SetupCommand(string Password) : IRequest<SetupResult>;

public record SetupRequest(string Password);

public record SetupResult(string PasswordHash, string TotpSecret, string TotpUri);
