using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KcwOps.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEpicDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                table: "Epics",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "Epics",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Epics");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Epics");
        }
    }
}
