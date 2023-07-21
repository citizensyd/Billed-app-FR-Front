/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(\d{1,2}) ([a-zA-Z]{3}\.) (\d{2})$/).map((a) => a.innerHTML);
      const datesSorted = [...dates].sort((a, b) => b.localeCompare(a));
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("When I click on the eye icon of a bill", () => {
  test("It should open a modal", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    document.body.innerHTML = BillsUI({ data: bills });
    const title = screen.getByText("Mes notes de frais");
    const iconEyes = screen.getAllByTestId("icon-eye");
    iconEyes.forEach((icon) => {
      expect(icon).toBeInTheDocument();
    });
    expect(title).toBeInTheDocument();

    const billsManager = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    const iconEye = iconEyes[0];
    const handleClickIconEye = jest.fn(billsManager.handleClickIconEye(iconEye));
    iconEye.addEventListener("click", handleClickIconEye);
    userEvent.click(iconEye);
    expect(handleClickIconEye).toHaveBeenCalled();
    const modalTitle = screen.getByText("Justificatif");
    expect(modalTitle).toBeInTheDocument();
  });
});
