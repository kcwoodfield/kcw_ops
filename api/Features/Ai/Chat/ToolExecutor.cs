using System.Text.Json;
using System.Text.Json.Nodes;
using KcwOps.Api.Domain;
using KcwOps.Api.Features.Stories;
using KcwOps.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Features.Ai.Chat;

public class ToolExecutor(AppDbContext db)
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

    private async Task<string> CreateStoryAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "projectId", out var projectId))
            return "{\"error\":\"projectId is required\"}";

        var title = input["title"]?.GetValue<string>();
        if (string.IsNullOrWhiteSpace(title))
            return "{\"error\":\"title is required\"}";

        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId, ct);
        if (project is null) return "{\"error\":\"Project not found\"}";

        Guid? epicId = TryGetGuid(input, "epicId", out var eid) ? eid : null;
        if (!epicId.HasValue)
            epicId = await db.Epics.Where(e => e.ProjectId == projectId).Select(e => (Guid?)e.Id).FirstOrDefaultAsync(ct);

        Guid? sprintId = TryGetGuid(input, "sprintId", out var sid) ? sid : null;
        if (sprintId.HasValue)
        {
            var ok = await db.Sprints.AnyAsync(s => s.Id == sprintId && s.ProjectId == projectId, ct);
            if (!ok) return "{\"error\":\"Sprint does not belong to this project\"}";
        }

        var statusStr = input["status"]?.GetValue<string>();
        var status = StoryEnums.TryParseStatus(statusStr ?? "todo", out var ps) ? ps : StoryStatus.Todo;

        var priorityStr = input["priority"]?.GetValue<string>();
        var priority = StoryEnums.TryParsePriority(priorityStr ?? "med", out var pp) ? pp : Priority.Med;

        var points = input["points"]?.GetValue<int>() ?? 1;
        if (!StoryEnums.FibonacciPoints.Contains(points)) points = 1;

        var maxNumber = await db.Stories.Where(s => s.ProjectId == projectId).MaxAsync(s => (int?)s.Number, ct) ?? 0;
        var maxSort   = await db.Stories.Where(s => s.ProjectId == projectId && s.SprintId == sprintId && s.Status == status).MaxAsync(s => (int?)s.SortOrder, ct) ?? 0;

        var story = new Story
        {
            Id          = Guid.NewGuid(),
            ProjectId   = projectId,
            EpicId      = epicId ?? Guid.Empty,
            SprintId    = sprintId,
            Number      = maxNumber + 1,
            SortOrder   = maxSort + 1000,
            Title       = title.Trim(),
            Description = input["description"]?.GetValue<string>(),
            Status      = status,
            Priority    = priority,
            Points      = points,
            AssigneeId  = input["assigneeId"]?.GetValue<string>() is { Length: > 0 } a ? a : null,
            Labels      = [],
        };

        db.Stories.Add(story);
        await db.SaveChangesAsync(ct);

        return JsonSerializer.Serialize(new
        {
            id      = story.Id,
            storyId = $"{project.Key}-{story.Number}",
            story.Title,
            story.Status,
            story.Priority,
            story.Points,
            story.SprintId,
        }, Json);
    }

    private async Task<string> UpdateStoryAsync(JsonObject input, CancellationToken ct)
    {
        if (!TryGetGuid(input, "storyId", out var storyId))
            return "{\"error\":\"storyId is required\"}";

        var story = await db.Stories
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == storyId, ct);
        if (story is null) return "{\"error\":\"Story not found\"}";

        if (input["title"]?.GetValue<string>() is { } t) story.Title = t.Trim();
        if (input["description"]?.GetValue<string>() is { } d)
            story.Description = string.IsNullOrWhiteSpace(d) ? null : d;
        if (input["status"]?.GetValue<string>() is { } st && StoryEnums.TryParseStatus(st, out var parsedStatus))
            story.Status = parsedStatus;
        if (input["priority"]?.GetValue<string>() is { } pr && StoryEnums.TryParsePriority(pr, out var parsedPriority))
            story.Priority = parsedPriority;
        if (input["points"]?.GetValue<int>() is { } pts && StoryEnums.FibonacciPoints.Contains(pts))
            story.Points = pts;
        if (input["blocked"]?.GetValue<bool>() is { } bl)
            story.Blocked = bl;
        if (input["clearSprint"]?.GetValue<bool>() == true)
            story.SprintId = null;
        else if (TryGetGuid(input, "sprintId", out var newSprint))
            story.SprintId = newSprint;
        if (input["assigneeId"]?.GetValue<string>() is { } ai)
            story.AssigneeId = string.IsNullOrWhiteSpace(ai) ? null : ai;
        if (input["dueDate"]?.GetValue<string>() is { } dd)
            story.DueDate = string.IsNullOrWhiteSpace(dd) ? null : DateOnly.Parse(dd);

        await db.SaveChangesAsync(ct);

        return JsonSerializer.Serialize(new
        {
            id      = story.Id,
            storyId = $"{story.Project.Key}-{story.Number}",
            story.Title,
            story.Status,
            story.Priority,
            story.Points,
            story.Blocked,
            story.SprintId,
            story.AssigneeId,
        }, Json);
    }

    private static bool TryGetGuid(JsonObject input, string key, out Guid result)
    {
        result = Guid.Empty;
        var val = input[key]?.GetValue<string>();
        if (string.IsNullOrEmpty(val)) return false;
        return Guid.TryParse(val, out result);
    }
}
