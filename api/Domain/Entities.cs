namespace KcwOps.Api.Domain;

public class Program_
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public ICollection<Project> Projects { get; set; } = [];
}

public class Project
{
    public Guid Id { get; set; }
    public Guid ProgramId { get; set; }
    public string Name { get; set; } = "";
    public string Key { get; set; } = "";   // e.g. "AUTH"
    public string Color { get; set; } = "#7c5cff";
    public Program_ Program { get; set; } = null!;
    public ICollection<Epic> Epics { get; set; } = [];
    public ICollection<Sprint> Sprints { get; set; } = [];
}

public class Epic
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = "";
    public string Color { get; set; } = "#7c5cff";
    public Project Project { get; set; } = null!;
    public ICollection<Story> Stories { get; set; } = [];
}

public class Sprint
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = "";
    public string? Goal { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public SprintState State { get; set; } = SprintState.Planned;
    public Project Project { get; set; } = null!;
    public ICollection<Story> Stories { get; set; } = [];
}

public enum SprintState { Planned, Active, Completed }

public class Story
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid EpicId { get; set; }
    public Guid? SprintId { get; set; }       // null = backlog
    public int Number { get; set; }           // monotonic per project → AUTH-247
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public StoryStatus Status { get; set; } = StoryStatus.Todo;
    public Priority Priority { get; set; } = Priority.Med;
    public int Points { get; set; } = 1;      // Fibonacci: 1 2 3 5 8 13 21
    public bool Blocked { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? AssigneeId { get; set; }
    public string[] Labels { get; set; } = [];
    public Epic Epic { get; set; } = null!;
    public Sprint? Sprint { get; set; }
    public Project Project { get; set; } = null!;
}

public enum StoryStatus { Todo, Progress, Review, Done }
public enum Priority { Urgent = 0, High = 1, Med = 2, Low = 3 }
