import React from "react";
import { render, screen } from "@testing-library/react";

import ServicesettingsPage from "../ServicesettingsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders servicesettings page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <ServicesettingsPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("servicesettings-datatable")).toBeInTheDocument();
    expect(screen.getByRole("servicesettings-add-button")).toBeInTheDocument();
});
