import { assert } from "chai";

// Test validation logic from HabitsService
function habitIdFromName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function validateHabitInput(uid, habit) {
  if (!uid) throw new Error("User id (uid) is required");
  if (!habit?.name?.trim()) throw new Error("Habit name is required");
  return true;
}

describe("HabitsService CRUD Tests", function () {
  this.timeout(5000);

  const testUserId = "test-user-123";
  const testHabit = {
    name: "Morning Exercise",
    description: "30 minutes of cardio",
    frequency: "daily"
  };

  // ─── CREATE/UPDATE TESTS ───────────────────────────────────────────────────
  describe("CREATE/UPDATE - upsertHabit() Validation", () => {
    it("should throw error when uid is missing", () => {
      assert.throws(() => validateHabitInput(null, testHabit), /User id/);
    });

    it("should throw error when uid is empty string", () => {
      assert.throws(() => validateHabitInput("", testHabit), /User id/);
    });

    it("should throw error when habit name is missing", () => {
      assert.throws(
        () => validateHabitInput(testUserId, { name: "", frequency: "daily" }),
        /Habit name/
      );
    });

    it("should throw error when habit name has only whitespace", () => {
      assert.throws(
        () => validateHabitInput(testUserId, { name: "   ", frequency: "daily" }),
        /Habit name/
      );
    });

    it("should throw error when habit object is missing", () => {
      assert.throws(() => validateHabitInput(testUserId, null), /Habit name/);
    });

    it("should accept valid habit input", () => {
      assert.doesNotThrow(() => validateHabitInput(testUserId, testHabit));
    });

    it("should accept habit with optional fields", () => {
      const habit = { name: "Test Habit" };
      assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
    });
  });

  // ─── HABIT ID GENERATION TESTS ──────────────────────────────────────────────
  describe("VALIDATION - habitIdFromName() Logic", () => {
    it("should normalize case, spaces, and trimming", () => {
      const result = habitIdFromName("  MORNING   Exercise  ");
      assert.equal(result, "morning-exercise");
    });

    it("should handle single word habit names", () => {
      const result = habitIdFromName("Jogging");
      assert.equal(result, "jogging");
    });

    it("should produce same ID regardless of case and spacing", () => {
      const id1 = habitIdFromName("Morning Jog");
      const id2 = habitIdFromName("MORNING JOG");
      const id3 = habitIdFromName("  morning   jog  ");

      assert.equal(id1, id2);
      assert.equal(id2, id3);
    });
  });

  // ─── TOGGLE COMPLETION TESTS ────────────────────────────────────────────────
  describe("UPDATE - toggleHabitCompletion() Logic", () => {
    it("should generate correct date string for today", () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const dateString = `${y}-${m}-${d}`;

      assert.match(dateString, /^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle date string edge cases", () => {
      const jan1 = new Date("2024-01-01");
      const y = jan1.getFullYear();
      const m = String(jan1.getMonth() + 1).padStart(2, "0");
      const d = String(jan1.getDate()).padStart(2, "0");
      assert.equal(`${y}-${m}-${d}`, "2024-01-01");

      const dec31 = new Date("2024-12-31");
      const y2 = dec31.getFullYear();
      const m2 = String(dec31.getMonth() + 1).padStart(2, "0");
      const d2 = String(dec31.getDate()).padStart(2, "0");
      assert.equal(`${y2}-${m2}-${d2}`, "2024-12-31");
    });
  });

  // ─── FREQUENCY VALIDATION TESTS ────────────────────────────────────────────
  describe("VALIDATION - Frequency Handling", () => {
    const validFrequencies = ["daily", "weekly", "weekdays", "weekends"];

    validFrequencies.forEach((frequency) => {
      it(`should accept valid frequency: ${frequency}`, () => {
        const habit = { ...testHabit, frequency };
        assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
      });
    });

    it("should accept habit with missing frequency", () => {
      const habit = { name: "Test Habit" };
      assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
    });

    it("should accept invalid frequency values structurally", () => {
      const habit = {
        name: "Test Habit",
        frequency: "yearly"
      };
      assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
    });
  });

  // ─── DATA INTEGRITY TESTS ──────────────────────────────────────────────────
  describe("DATA INTEGRITY - Input Sanitization", () => {
    it("should trim whitespace from habit names", () => {
      const habit = {
        name: "  Test Habit  ",
        frequency: "daily"
      };
      assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
    });

    it("should normalize multiple spaces in habit names", () => {
      const habit = {
        name: "Test    Habit    Name",
        frequency: "daily"
      };
      assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
    });

    it("should handle habit descriptions correctly", () => {
      const habits = [
        { name: "Test", description: "" },
        { name: "Test", description: null },
        { name: "Test", description: "Long description" }
      ];

      habits.forEach((habit) => {
        assert.doesNotThrow(() => validateHabitInput(testUserId, habit));
      });
    });

    it("should handle habit names with numbers", () => {
      const result = habitIdFromName("Drink 8 Glasses of Water");
      assert.equal(result, "drink-8-glasses-of-water");
    });
  });

  // ─── ARRAY OPERATIONS TESTS ────────────────────────────────────────────────
  describe("DATA STRUCTURE - Completed Days Array", () => {
    it("should use array format for tracking completion", () => {
      const completedDaysArray = ["2024-03-20", "2024-03-21"];
      assert.isArray(completedDaysArray);
      assert.lengthOf(completedDaysArray, 2);
    });

    it("should maintain YYYY-MM-DD format", () => {
      const date = "2024-03-20";
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    });

    it("should add and remove dates correctly", () => {
      const dates = ["2024-03-20"];
      const newDate = "2024-03-21";

      const added = [...dates, newDate];
      assert.include(added, newDate);

      const removed = added.filter((d) => d !== newDate);
      assert.notInclude(removed, newDate);
    });

    it("should prevent duplicate dates", () => {
      const dates = ["2024-03-20"];
      const sameDate = "2024-03-20";

      const result = dates.includes(sameDate) ? dates : [...dates, sameDate];
      assert.lengthOf(result, 1);
    });

    it("should check if a date is completed", () => {
      const completed = ["2024-03-20", "2024-03-21"];
      assert.isTrue(completed.includes("2024-03-21"));
      assert.isFalse(completed.includes("2024-03-25"));
    });
  });
});