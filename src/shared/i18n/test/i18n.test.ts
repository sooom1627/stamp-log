import { i18n } from "..";

describe("S-045 ST-002 i18n", () => {
  test("starts in English in tests", () => {
    expect(i18n.language).toBe("en");
    expect(i18n.t("common.retry")).toBe("Retry");
  });

  test("translates into Japanese", async () => {
    await i18n.changeLanguage("ja");

    expect(i18n.t("common.retry")).toBe("再試行");
  });
});
