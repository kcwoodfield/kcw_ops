using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Users.GetUsers;

public class GetUsersHandler(AppDbContext db) : IRequestHandler<GetUsersQuery, IEnumerable<UserDto>>
{
    public async Task<IEnumerable<UserDto>> Handle(GetUsersQuery _, CancellationToken ct)
    {
        return await db.Users
            .OrderBy(u => u.Name)
            .Select(u => new UserDto(u.Id, u.Name, u.Initials, u.Color))
            .ToListAsync(ct);
    }
}
