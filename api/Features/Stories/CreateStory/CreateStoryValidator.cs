using FluentValidation;

namespace KcwOps.Api.Features.Stories.CreateStory;

public class CreateStoryValidator : AbstractValidator<CreateStoryCommand>
{
    public CreateStoryValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);

        RuleFor(x => x.Status)
            .Must(s => s is null || StoryEnums.TryParseStatus(s, out _))
            .WithMessage("Status must be todo, progress, review, or done.");

        RuleFor(x => x.Priority)
            .Must(p => p is null || StoryEnums.TryParsePriority(p, out _))
            .WithMessage("Priority must be urgent, high, med, or low.");

        RuleFor(x => x.Points)
            .Must(p => p is null || StoryEnums.FibonacciPoints.Contains(p.Value))
            .WithMessage("Points must be a Fibonacci value: 1, 2, 3, 5, 8, 13, 21.");
    }
}
