namespace KcwOps.Api.Features.Auth;

public class AuthSettings
{
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string TotpSecret { get; set; } = "";
    public string JwtSecret { get; set; } = "";
    public string JwtIssuer { get; set; } = "kcw-ops";
    public int JwtExpiryMinutes { get; set; } = 15;
    public int TempTokenExpiryMinutes { get; set; } = 5;
    public int RefreshExpiryDays { get; set; } = 7;
}
