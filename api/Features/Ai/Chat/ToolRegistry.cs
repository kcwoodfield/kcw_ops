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

        Tool("create_story",
            "Create a new story/ticket in a project. Always call list_projects first to get the projectId if you don't have it.",
            new JsonObject
            {
                ["projectId"]   = Prop("string",  "Project UUID (required)"),
                ["title"]       = Prop("string",  "Story title (required)"),
                ["description"] = Prop("string",  "Optional description"),
                ["status"]      = Prop("string",  "todo | progress | review | done (default: todo)"),
                ["priority"]    = Prop("string",  "urgent | high | med | low (default: med)"),
                ["points"]      = Prop("integer", "Fibonacci points: 1 2 3 5 8 13 21 (default: 1)"),
                ["sprintId"]    = Prop("string",  "Sprint UUID — omit to add to backlog"),
                ["epicId"]      = Prop("string",  "Epic UUID — omit to use the first project epic"),
                ["assigneeId"]  = Prop("string",  "User ID (short slug) to assign"),
            },
            required: ["projectId", "title"]),

        Tool("update_story",
            "Update fields on an existing story. Only provide fields you want to change.",
            new JsonObject
            {
                ["storyId"]     = Prop("string",  "Story UUID (required)"),
                ["title"]       = Prop("string",  "New title"),
                ["description"] = Prop("string",  "New description (empty string clears it)"),
                ["status"]      = Prop("string",  "todo | progress | review | done"),
                ["priority"]    = Prop("string",  "urgent | high | med | low"),
                ["points"]      = Prop("integer", "Fibonacci points: 1 2 3 5 8 13 21"),
                ["blocked"]     = Prop("boolean", "Set blocked flag"),
                ["sprintId"]    = Prop("string",  "Move to this sprint UUID"),
                ["clearSprint"] = Prop("boolean", "If true, move story to backlog"),
                ["assigneeId"]  = Prop("string",  "User ID to assign (empty string unassigns)"),
                ["dueDate"]     = Prop("string",  "Due date as YYYY-MM-DD (empty string clears it)"),
            },
            required: ["storyId"]),
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
