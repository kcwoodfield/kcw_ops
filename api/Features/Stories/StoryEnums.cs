using KcwOps.Api.Domain;

namespace KcwOps.Api.Features.Stories;

public static class StoryEnums
{
    public static readonly HashSet<int> FibonacciPoints = [1, 2, 3, 5, 8, 13, 21];

    public static bool TryParseStatus(string value, out StoryStatus status)
    {
        status = default;
        return value switch
        {
            "todo" => Assign(StoryStatus.Todo, out status),
            "progress" => Assign(StoryStatus.Progress, out status),
            "review" => Assign(StoryStatus.Review, out status),
            "done" => Assign(StoryStatus.Done, out status),
            _ => Enum.TryParse(value, ignoreCase: true, out status),
        };
    }

    public static bool TryParsePriority(string value, out Priority priority)
    {
        priority = default;
        return value switch
        {
            "urgent" => Assign(Priority.Urgent, out priority),
            "high" => Assign(Priority.High, out priority),
            "med" => Assign(Priority.Med, out priority),
            "low" => Assign(Priority.Low, out priority),
            _ => Enum.TryParse(value, ignoreCase: true, out priority),
        };
    }

    private static bool Assign<T>(T value, out T target) where T : struct
    {
        target = value;
        return true;
    }
}
