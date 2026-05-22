using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KcwOps.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityEventProjectFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ActivityEvents_ProjectId",
                table: "ActivityEvents",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActivityEvents_Projects_ProjectId",
                table: "ActivityEvents",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActivityEvents_Projects_ProjectId",
                table: "ActivityEvents");

            migrationBuilder.DropIndex(
                name: "IX_ActivityEvents_ProjectId",
                table: "ActivityEvents");
        }
    }
}
