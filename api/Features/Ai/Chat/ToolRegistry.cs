using System.Text.Json.Nodes;

namespace KcwOps.Api.Features.Ai.Chat;

public static class ToolRegistry
{
    public static readonly JsonArray Tools = new()
    {
        Tool("list_projects",
            "List all projects in the workspace.",
            new JsonObject()),

        Tool("list_stories",
            "Get stories in a project or sprint. Use filters to narrow results.",
            new JsonObject
            {
                ["projectId"]   = Prop("string",  "Project UUID (optional)"),
                ["sprintId"]    = Prop("string",  "Sprint UUID — return only this sprint's stories (optional)"),
                ["backlogOnly"] = Prop("boolean", "If true, return only unassigned backlog stories (optional)"),
                ["blockedOnly"] = Prop("boolean", "If true, return only blocked stories (optional)"),
            }),

        Tool("list_epics",
            "Get all epics in a project.",
            new JsonObject
            {
                ["projectId"] = Prop("string", "Project UUID (required)"),
            },
            required: ["projectId"]),

        Tool("list_sprints",
            "Get sprints in a project, including their state (planned/active/completed) and dates.",
            new JsonObject
            {
                ["projectId"] = Prop("string", "Project UUID (required)"),
            },
            required: ["projectId"]),

        Tool("get_story",
            "Get full detail for a single story by its UUID.",
            new JsonObject
            {
                ["storyId"] = Prop("string", "Story UUID (required)"),
            },
            required: ["storyId"]),

        Tool("list_users",
            "Get all team members.",
            new JsonObject()),
    };

    private static JsonObject Tool(
        string name,
        string description,
        JsonObject properties,
        string[]? required = null)
    {
        var schema = new JsonObject
        {
            ["type"]       = "object",
            ["properties"] = properties,
        };
        if (required is { Length: > 0 })
        {
            var arr = new JsonArray();
            foreach (var r in required) arr.Add(r);
            schema["required"] = arr;
        }
        return new JsonObject
        {
            ["name"]         = name,
            ["description"]  = description,
            ["input_schema"] = schema,
        };
    }

    private static JsonObject Prop(string type, string description) =>
        new() { ["type"] = type, ["description"] = description };
}
