using MediatR;

namespace KcwOps.Api.Features.Auth.Refresh;

public record RefreshCommand(string RefreshToken) : IRequest<RefreshResult>;

public record RefreshResult(bool Success, string? AccessToken, string? RefreshToken);
