using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KcwOps.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStorySortOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Stories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""UPDATE "Stories" SET "SortOrder" = "Number" * 1000""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Stories");
        }
    }
}
