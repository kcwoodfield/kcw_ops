using System.Text.Json;
using System.Text.Json.Nodes;
using KcwOps.Api.Features.Stories.CreateStory;
using KcwOps.Api.Features.Stories.UpdateStory;
using KcwOps.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Ai.Chat;

public class ToolExecutor(AppDbContext db, IMediator mediator)
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task<string> ExecuteAsync(string tool, JsonObject input, CancellationToken ct)
    {
        return tool switch
        {
            "list_projects"  => await ListProjectsAsync(ct),
            "list_stories"   => await ListStoriesAsync(input, ct),
            "list_epics"     => await ListEpicsAsync(input, ct),
            "list_sprints"   => await ListSprintsAsync(input, ct),
            "get_story"      => await GetStoryAsync(input, ct),
            "list_users"     => await ListUsersAsync(ct),
            "create_story"   => await CreateStoryAsync(input, ct),
            "update_story"   => await UpdateStoryAsync(input, ct),
            _                => $"{{\"error\":\"Unknown tool: {tool}\"}}",
        };
    }

    private async Task<string> ListProjectsAsync(CancellationToken ct)
    {
        var projects = await db.Projects
            .Select(p => new { p.Id, p.Name, p.Key, p.Color })
            .ToListAsync(ct);
        return JsonSerializer.Serialize(projects, Json);
    }

    private async Task<string> ListStoriesAsync(JsonObject input, CancellationToken ct)
    {
        var query = db.Stories
            .Include(s => s.Epic)
            .Include(s => s.Sprint)
            .AsQueryable();

        if (TryGetGuid(input, "projectId", out var projectId))
            query = query.Where(s => s.ProjectId == projectId);

        if (TryGetGuid(input, "sprintId", out var sprintId))
            query = query.Where(s => s.SprintId == sprintId);

        if (input["backlogOnly"]?.GetValue<bool>() == true)
            query = query.Where(s => s.SprintId == null);

        if (input["blockedOnly"]?.GetValue<bool>() == true)
            query = query.Where(s => s.Blocked);

        var stories = await query
            .OrderBy(s => s.SortOrder)
            .Select(s => new
            {
                s.Id,
                StoryId  = s.Project.Key + "-" + s.Number,
                s.Title,
                s.Status,
                s.Priority,
                s.Points,
                s.Blocked,
                s.DueDate,
                s.AssigneeId,
                EpicTitle  = s.Epic.Title,
                SprintName = s.Sprint != null ? s.Sprint.Name : null,
            })
            .ToListAsync(ct);

        return JsonSerializer.Serialize(stories, Json);
    }

    private async Task<string> ListEpicsAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "projectId", out var projectId))
            return "{\"error\":\"projectId is required\"}";

        var epics = await db.Epics
            .Where(e => e.ProjectId == projectId)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.Color,
                e.StartDate,
                e.EndDate,
                StoryCount = e.Stories.Count,
                DoneCount  = e.Stories.Count(s => s.Status == Domain.StoryStatus.Done),
            })
            .ToListAsync(ct);

        return JsonSerializer.Serialize(epics, Json);
    }

    private async Task<string> ListSprintsAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "projectId", out var projectId))
            return "{\"error\":\"projectId is required\"}";

        var sprints = await db.Sprints
            .Where(s => s.ProjectId == projectId)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Goal,
                s.State,
                s.StartDate,
                s.EndDate,
                StoryCount  = s.Stories.Count,
                DoneCount   = s.Stories.Count(st => st.Status == Domain.StoryStatus.Done),
                BlockedCount = s.Stories.Count(st => st.Blocked),
                TotalPoints = s.Stories.Sum(st => st.Points),
            })
            .OrderByDescending(s => s.StartDate)
            .ToListAsync(ct);

        return JsonSerializer.Serialize(sprints, Json);
    }

    private async Task<string> GetStoryAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "storyId", out var storyId))
            return "{\"error\":\"storyId is required\"}";

        var story = await db.Stories
            .Include(s => s.Epic)
            .Include(s => s.Sprint)
            .Include(s => s.Project)
            .Where(s => s.Id == storyId)
            .Select(s => new
            {
                s.Id,
                StoryId     = s.Project.Key + "-" + s.Number,
                s.Title,
                s.Description,
                s.Status,
                s.Priority,
                s.Points,
                s.Blocked,
                s.DueDate,
                s.AssigneeId,
                s.Labels,
                EpicTitle   = s.Epic.Title,
                SprintName  = s.Sprint != null ? s.Sprint.Name : null,
                ProjectName = s.Project.Name,
            })
            .FirstOrDefaultAsync(ct);

        if (story is null) return "{\"error\":\"Story not found\"}";
        return JsonSerializer.Serialize(story, Json);
    }

    private async Task<string> ListUsersAsync(CancellationToken ct)
    {
        var users = await db.Users
            .Select(u => new { u.Id, u.Name, u.Initials, u.Color })
            .ToListAsync(ct);
        return JsonSerializer.Serialize(users, Json);
    }

    // Story writes go through the MediatR commands so the AI path shares one
    // implementation with the REST path — numbering, sort order, epic fallback,
    // sprint-ownership checks, validation and activity logging all stay in sync.
    private async Task<string> CreateStoryAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "projectId", out var projectId))
            return "{\"error\":\"projectId is required\"}";

        var title = input["title"]?.GetValue<string>();
        if (string.IsNullOrWhiteSpace(title))
            return "{\"error\":\"title is required\"}";

        Guid? epicId   = TryGetGuid(input, "epicId", out var eid) ? eid : null;
        Guid? sprintId = TryGetGuid(input, "sprintId", out var sid) ? sid : null;

        try
        {
            var created = await mediator.Send(new CreateStoryCommand(
                projectId,
                epicId,
                title,
                sprintId,
                input["status"]?.GetValue<string>(),
                input["priority"]?.GetValue<string>(),
                input["points"]?.GetValue<int>()
            ), ct);

            // CreateStoryCommand cannot set description/assignee — apply via update if given.
            var description = input["description"]?.GetValue<string>();
            var assigneeId  = input["assigneeId"]?.GetValue<string>();
            if (!string.IsNullOrWhiteSpace(description) || !string.IsNullOrWhiteSpace(assigneeId))
            {
                var updated = await mediator.Send(new UpdateStoryCommand(
                    created.Id, null, description, null, null, null, null, null,
                    null, null, false, null, null, assigneeId), ct);
                return JsonSerializer.Serialize(updated, Json);
            }

            return JsonSerializer.Serialize(created, Json);
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { error = ex.Message }, Json);
        }
    }

    private async Task<string> UpdateStoryAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "storyId", out var storyId))
            return "{\"error\":\"storyId is required\"}";

        try
        {
            var updated = await mediator.Send(new UpdateStoryCommand(
                storyId,
                input["title"]?.GetValue<string>(),
                input["description"]?.GetValue<string>(),
                input["status"]?.GetValue<string>(),
                input["priority"]?.GetValue<string>(),
                input["points"]?.GetValue<int>(),
                input["blocked"]?.GetValue<bool>(),
                Starred: null,
                EpicId: null,
                SprintId: TryGetGuid(input, "sprintId", out var newSprint) ? newSprint : null,
                ClearSprint: input["clearSprint"]?.GetValue<bool>() == true,
                DueDate: input["dueDate"]?.GetValue<string>(),
                Labels: null,
                AssigneeId: input["assigneeId"]?.GetValue<string>()
            ), ct);

            return updated is null
                ? "{\"error\":\"Story not found\"}"
                : JsonSerializer.Serialize(updated, Json);
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { error = ex.Message }, Json);
        }
    }

    private static bool TryGetGuid(JsonObject input, string key, out Guid result)
    {
        result = Guid.Empty;
        var val = input[key]?.GetValue<string>();
        if (string.IsNullOrEmpty(val)) return false;
        return Guid.TryParse(val, out result);
    }
}
