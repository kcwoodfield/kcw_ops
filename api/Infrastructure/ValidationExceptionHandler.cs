using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace KcwOps.Api.Infrastructure;

public class ValidationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        if (exception is not ValidationException ve)
            return false;

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        await httpContext.Response.WriteAsJsonAsync(new
        {
            error = "Validation failed.",
            errors = ve.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }),
        }, ct);

        return true;
    }
}
