/**
 * @jest-environment jsdom
 */

/** Modified Line *******************************************/
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
/** End Modified Line ***************************************/


describe("Given I am connected as an employee", () => {
  /* Envelope Icon Active Test */
  describe("When I am on NewBills Page", () => {
    test("Then Envelope icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const windowIcon = screen.getByTestId('icon-mail');
      const iconActive = windowIcon.classList.contains('active-icon');
      /* Expected Result */
      expect(iconActive).toBeTruthy();
    });
  });

  /* New Bill Submit Button Test */
  describe("When I click on New Bill Button", ()=>{
    test("Then Form page should open", ()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const formBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      const handleNewBillFormSubmit = jest.fn(formBill.handleSubmit);
      const newBillSubmit = screen.getByTestId('form-new-bill');
      newBillSubmit.addEventListener('click', handleNewBillFormSubmit);
      fireEvent.click(newBillSubmit);
      /* Expected Result */
      expect(handleNewBillFormSubmit).toHaveBeenCalled();
      expect(newBillSubmit).toBeTruthy();
    })
  });

  /* New Bill File Type Test */
  describe("When I click on Choose File", ()=>{
    test("Then file accepted must be jpg, jpeg, png", ()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = NewBillUI();
      const formBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      const handleChooseFile = jest.fn(formBill.handleChangeFile);
      const browseFile = screen.getByTestId('file');
      browseFile.addEventListener('change', handleChooseFile);
      const file = new File(['image.jpeg'], 'image.jpeg', {type: 'image/jpeg'});
      fireEvent.change(browseFile, { target: { files: [file] } });
      /* Expected Result */
      expect(handleChooseFile).toHaveBeenCalled();
      expect(browseFile.files[0].name).toBe("image.jpeg");
    })
  });

  /* Errors 404/500 Tests */
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
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = await screen.getByText(/Erreur 404/);
      /* Expected Result */
      expect(message).toBeTruthy();
    });

    /* Error 500 */
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      /* Expected Result */
      expect(message).toBeTruthy()
    })
  })
});