using KcwOps.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace KcwOps.Api.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Projects.AnyAsync()) return;

        var auth = new Project { Id = Guid.NewGuid(), Name = "Auth & Identity",       Key = "AUTH", Color = "#7c5cff" };
        var bil  = new Project { Id = Guid.NewGuid(), Name = "Billing v2",            Key = "BIL",  Color = "#4cc9e7" };
        var onb  = new Project { Id = Guid.NewGuid(), Name = "Onboarding rework",     Key = "ONB",  Color = "#f0b34a" };
        var act  = new Project { Id = Guid.NewGuid(), Name = "Activation funnels",    Key = "ACT",  Color = "#4ade80" };
        var refs = new Project { Id = Guid.NewGuid(), Name = "Referrals",             Key = "REF",  Color = "#f87171" };
        var obs  = new Project { Id = Guid.NewGuid(), Name = "Observability",         Key = "OBS",  Color = "#a78bfa" };
        var mig  = new Project { Id = Guid.NewGuid(), Name = "Postgres 16 migration", Key = "MIG",  Color = "#94a3b8" };

        var ep12 = new Epic { Id = Guid.NewGuid(), ProjectId = auth.Id, Title = "Passkey-first sign-in",    Color = "#7c5cff" };
        var ep14 = new Epic { Id = Guid.NewGuid(), ProjectId = auth.Id, Title = "Org / workspace switcher", Color = "#4cc9e7" };
        var ep17 = new Epic { Id = Guid.NewGuid(), ProjectId = auth.Id, Title = "SCIM + SSO hardening",     Color = "#f0b34a" };
        var ep19 = new Epic { Id = Guid.NewGuid(), ProjectId = auth.Id, Title = "Session telemetry",        Color = "#4ade80" };

        var sp31 = new Sprint { Id = Guid.NewGuid(), ProjectId = auth.Id, Name = "Sprint 31", Goal = "Passkey enrollment GA",           StartDate = new DateOnly(2026,5,4),  EndDate = new DateOnly(2026,5,17), State = SprintState.Completed };
        var sp32 = new Sprint { Id = Guid.NewGuid(), ProjectId = auth.Id, Name = "Sprint 32", Goal = "Org switcher + SCIM ground-work", StartDate = new DateOnly(2026,5,18), EndDate = new DateOnly(2026,5,31), State = SprintState.Active    };
        var sp33 = new Sprint { Id = Guid.NewGuid(), ProjectId = auth.Id, Name = "Sprint 33", Goal = "SSO hardening / IdP coverage",    StartDate = new DateOnly(2026,6,1),  EndDate = new DateOnly(2026,6,14), State = SprintState.Planned   };
        var sp34 = new Sprint { Id = Guid.NewGuid(), ProjectId = auth.Id, Name = "Sprint 34", Goal = "TBD",                             StartDate = new DateOnly(2026,6,15), EndDate = new DateOnly(2026,6,28), State = SprintState.Planned   };

        var stories = new List<Story>
        {
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = sp32.Id, Number = 241, Title = "Passkey enrollment flow — error states",    Status = StoryStatus.Progress, Priority = Priority.High,   Points = 5,  Labels = ["frontend","a11y"],     Blocked = false, DueDate = new DateOnly(2026,5,28) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep19.Id, SprintId = sp32.Id, Number = 247, Title = "Migrate session store to Redis cluster",     Status = StoryStatus.Progress, Priority = Priority.Urgent, Points = 8,  Labels = ["backend","infra"],     Blocked = true,  DueDate = new DateOnly(2026,5,26) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = sp32.Id, Number = 244, Title = "Org switcher keyboard shortcuts",            Status = StoryStatus.Progress, Priority = Priority.Med,    Points = 3,  Labels = ["frontend"],           Blocked = false, DueDate = new DateOnly(2026,5,29) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = sp32.Id, Number = 251, Title = "Audit log entry for org-role change",        Status = StoryStatus.Review,   Priority = Priority.Med,    Points = 2,  Labels = ["backend","audit"],     Blocked = false, DueDate = new DateOnly(2026,5,24) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = sp32.Id, Number = 238, Title = "Recovery codes regen rate-limit",            Status = StoryStatus.Review,   Priority = Priority.High,   Points = 3,  Labels = ["backend","security"],  Blocked = false, DueDate = new DateOnly(2026,5,25) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = sp32.Id, Number = 252, Title = "Empty-state for new workspaces",             Status = StoryStatus.Review,   Priority = Priority.Low,    Points = 2,  Labels = ["frontend","design"],   Blocked = false, DueDate = new DateOnly(2026,5,25) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = sp32.Id, Number = 233, Title = "Magic-link deprecation banner",              Status = StoryStatus.Done,     Priority = Priority.Med,    Points = 1,  Labels = ["frontend"],           Blocked = false, DueDate = new DateOnly(2026,5,19) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep19.Id, SprintId = sp32.Id, Number = 235, Title = "Telemetry: failed passkey attempts",         Status = StoryStatus.Done,     Priority = Priority.Med,    Points = 3,  Labels = ["backend","telemetry"], Blocked = false, DueDate = new DateOnly(2026,5,20) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep17.Id, SprintId = sp32.Id, Number = 249, Title = "Per-IdP claim mapping schema",               Status = StoryStatus.Todo,     Priority = Priority.High,   Points = 5,  Labels = ["backend","spec"],      Blocked = false, DueDate = new DateOnly(2026,5,31) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = sp32.Id, Number = 256, Title = "Workspace-scoped feature flag plumbing",     Status = StoryStatus.Todo,     Priority = Priority.Med,    Points = 5,  Labels = ["frontend","backend"],  Blocked = false, DueDate = new DateOnly(2026,5,30) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep19.Id, SprintId = sp32.Id, Number = 258, Title = "Block stale session resume across orgs",     Status = StoryStatus.Todo,     Priority = Priority.Urgent, Points = 2,  Labels = ["security"],           Blocked = false, DueDate = new DateOnly(2026,5,27) },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = sp32.Id, Number = 261, Title = "i18n string sweep for switcher",             Status = StoryStatus.Todo,     Priority = Priority.Low,    Points = 1,  Labels = ["i18n"],               Blocked = false, DueDate = new DateOnly(2026,6,2)  },
            // Backlog
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep17.Id, SprintId = null, Number = 263, Title = "OIDC discovery doc caching",              Status = StoryStatus.Todo, Priority = Priority.Med,  Points = 3,  Labels = ["backend"]             },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = null, Number = 264, Title = "Per-org branding on sign-in page",        Status = StoryStatus.Todo, Priority = Priority.Med,  Points = 8,  Labels = ["frontend","design"]   },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = null, Number = 265, Title = "Hardware-key fallback for passkey",       Status = StoryStatus.Todo, Priority = Priority.High, Points = 13, Labels = ["backend","security"]  },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep14.Id, SprintId = null, Number = 266, Title = "Bulk org-member CSV import",              Status = StoryStatus.Todo, Priority = Priority.Low,  Points = 5,  Labels = ["backend"]             },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep19.Id, SprintId = null, Number = 267, Title = "Session heatmap dashboard",               Status = StoryStatus.Todo, Priority = Priority.Low,  Points = 5,  Labels = ["analytics"]           },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep17.Id, SprintId = null, Number = 268, Title = "Just-in-time provisioning for Okta",     Status = StoryStatus.Todo, Priority = Priority.High, Points = 8,  Labels = ["backend","sso"]       },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep17.Id, SprintId = null, Number = 269, Title = "Force-MFA policy per org",               Status = StoryStatus.Todo, Priority = Priority.High, Points = 5,  Labels = ["backend","security"]  },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = null, Number = 270, Title = "Investigate WebAuthn L3 attestation",    Status = StoryStatus.Todo, Priority = Priority.Low,  Points = 2,  Labels = ["spike"]               },
            new() { Id = Guid.NewGuid(), ProjectId = auth.Id, EpicId = ep12.Id, SprintId = null, Number = 271, Title = "Doc: passkey FAQ for support",           Status = StoryStatus.Todo, Priority = Priority.Low,  Points = 1,  Labels = ["docs"]                },
        };

        foreach (StoryStatus status in Enum.GetValues<StoryStatus>())
        {
            var rank = 1000;
            foreach (var s in stories.Where(x => x.Status == status).OrderBy(x => x.Number))
            {
                s.SortOrder = rank;
                rank += 1000;
            }
        }

        db.Projects.AddRange(auth, bil, onb, act, refs, obs, mig);
        db.Epics.AddRange(ep12, ep14, ep17, ep19);
        db.Sprints.AddRange(sp31, sp32, sp33, sp34);
        db.Stories.AddRange(stories);

        await db.SaveChangesAsync();
    }
}
