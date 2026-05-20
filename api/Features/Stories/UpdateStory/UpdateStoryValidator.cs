using FluentValidation;

namespace KcwOps.Api.Features.Stories.UpdateStory;

public class UpdateStoryValidator : AbstractValidator<UpdateStoryCommand>
{
    public UpdateStoryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.Title)
            .MaximumLength(500)
            .When(x => x.Title is not null);

        RuleFor(x => x.Status)
            .Must(s => s is null || StoryEnums.TryParseStatus(s, out _))
            .WithMessage("Status must be todo, progress, review, or done.");

        RuleFor(x => x.Priority)
            .Must(p => p is null || StoryEnums.TryParsePriority(p, out _))
            .WithMessage("Priority must be urgent, high, med, or low.");

        RuleFor(x => x.Points)
            .Must(p => p is null || StoryEnums.FibonacciPoints.Contains(p.Value))
            .WithMessage("Points must be a Fibonacci value: 1, 2, 3, 5, 8, 13, 21.");

        RuleFor(x => x.DueDate)
            .Must(d => d is null || DateOnly.TryParse(d, out _))
            .WithMessage("DueDate must be yyyy-MM-dd.");
    }
}
