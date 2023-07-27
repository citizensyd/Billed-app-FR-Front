/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const iconMail = screen.getByTestId("icon-mail");
      expect(iconMail.classList.contains("active-icon")).toBe(true);
    });

    describe("When I submit a new Bill", () => {
      test("Then must save the bill", async () => {
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

        document.body.innerHTML = NewBillUI();

        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();

        const handleSubmit = jest.fn((e) => newBillInstance.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    describe("When file input changes", () => {
      test("Then file should be updated", async () => {
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

        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const e = {
          preventDefault: jest.fn(),
          target: { value: "C:\\fakepath\\test.jpg" },
        };

        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

        const fileInput = document.querySelector(`input[data-testid="file"]`);
        Object.defineProperty(fileInput, "files", {
          value: [file],
        });

        await newBill.handleChangeFile(e);

        expect(newBill.billId).toBe("1234");
        expect(newBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
        expect(newBill.fileName).toBe("test.jpg");
      });
    });
  });
});

//POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to new bill and post a new bill", () => {
    test("Add Bill from mock API POST", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();
      });
      test("Add bills from an API and fails with 404 message error", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store), 
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };
        const newBill = new NewBill({ document, onNavigate, store, localStorage });


        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await waitFor(() => expect(postSpy).toBeCalledWith(new Error("404")));
        const billsPage = screen.getByText("Mes notes de frais");
        expect(billsPage).toBeInTheDocument();
      });
      test("Add bills from an API and fails with 500 message error", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        const newBill = new NewBill({ document, onNavigate, store, localStorage });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await waitFor(() => expect(postSpy).toBeCalledWith(new Error("500")));
      });
    });
  });
});
