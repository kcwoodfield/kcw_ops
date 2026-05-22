using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KcwOps.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStoryStarred : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Starred",
                table: "Stories",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Starred",
                table: "Stories");
        }
    }
}
