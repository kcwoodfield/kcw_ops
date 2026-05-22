using KcwOps.Api.Domain;

namespace KcwOps.Api.Features.Stories;

public static class StoryMapper
{
    public static StoryDto ToDto(Story s) => new(
        s.Id,
        $"{s.Project.Key}-{s.Number}",
        s.Project.Key,
        s.Title,
        s.Status.ToString().ToLower(),
        s.Priority.ToString().ToLower(),
        s.Points,
        s.Blocked,
        s.Starred,
        s.EpicId,
        s.Epic.Title,
        s.Epic.Color,
        s.SprintId,
        s.Sprint?.Name,
        s.Labels,
        s.DueDate.HasValue ? s.DueDate.Value.ToString("yyyy-MM-dd") : null,
        s.AssigneeId,
        s.SortOrder
    );

    public static StoryDetailDto ToDetailDto(Story s, User? assignee = null) => new(
        s.Id,
        $"{s.Project.Key}-{s.Number}",
        s.ProjectId,
        s.Project.Key,
        s.Title,
        s.Description,
        s.Status.ToString().ToLower(),
        s.Priority.ToString().ToLower(),
        s.Points,
        s.Blocked,
        s.Starred,
        s.EpicId,
        s.Epic.Title,
        s.Epic.Color,
        s.SprintId,
        s.Sprint?.Name,
        s.Sprint?.State.ToString().ToLower(),
        s.Labels,
        s.DueDate.HasValue ? s.DueDate.Value.ToString("yyyy-MM-dd") : null,
        s.AssigneeId,
        assignee?.Name,
        assignee?.Initials,
        assignee?.Color,
        s.SortOrder
    );
}
