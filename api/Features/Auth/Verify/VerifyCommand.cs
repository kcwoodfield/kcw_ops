using MediatR;

namespace KcwOps.Api.Features.Auth.Verify;

public record VerifyCommand(string TempToken, string TotpCode) : IRequest<VerifyResult>;

public record VerifyRequest(string TempToken, string TotpCode);

public record VerifyResult(bool Success, string? AccessToken, string? RefreshToken);
