using MediatR;

namespace KcwOps.Api.Features.Auth.Login;

public record LoginCommand(string Username, string Password) : IRequest<LoginResult>;

public record LoginRequest(string Username, string Password);

public record LoginResult(bool RequiresMfa, string? TempToken);
