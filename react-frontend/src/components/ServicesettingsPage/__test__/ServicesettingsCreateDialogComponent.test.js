import React from "react";
import { render, screen } from "@testing-library/react";

import ServicesettingsCreateDialogComponent from "../ServicesettingsCreateDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders servicesettings create dialog", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <ServicesettingsCreateDialogComponent show={true} />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("servicesettings-create-dialog-component")).toBeInTheDocument();
});
