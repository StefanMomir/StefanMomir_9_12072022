/**
 * @jest-environment jsdom
 */

/** Modified Code *******************************************/
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
/** END Modified Code *******************************************/

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      /* Added Code */
      expect(windowIcon.className).toBe("active-icon");
      /* END Added Code */
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a > b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  /* New Bill Click Button Test */
  describe("When I click on New Bill Button", ()=>{
    test("then Form page should open", ()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const formBill = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      const handleNewBillFormClick = jest.fn(formBill.handleClickNewBill);
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener('click', handleNewBillFormClick);
      userEvent.click(newBillButton);
      const newFormBill = screen.getByTestId('form-new-bill');
      /* Expected Result */
      expect(handleNewBillFormClick).toHaveBeenCalled();
      expect(newFormBill).toBeTruthy();
    })
  });

  /* Icon Eye OnClick Modal Open Test */
  describe("When I click on Eye Icon", ()=>{
    test("Then proof modal should open", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = BillsUI({ data: bills });
      $.fn.modal = jest.fn();
      const pageBills = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      const eyeButton = screen.getAllByTestId('icon-eye')[0]
      const handleEyeClick = jest.fn(pageBills.handleClickIconEye(eyeButton));
      eyeButton.addEventListener('click', handleEyeClick);
      userEvent.click(eyeButton);
      /* Expected Result */
      expect(handleEyeClick).toHaveBeenCalled();
    });
  });

  /* Errors 404/500 Test */
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    
    /* Error 404 */
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      /* Expected Result */
      expect(message).toBeTruthy()
    })

    /* Error 500 */
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      /* Expected Result */
      expect(message).toBeTruthy()
    })
  })
});





