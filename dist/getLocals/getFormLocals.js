export default function ({ title, action, field }) {
    return {
        view: "form",
        viewData: {
            title,
            action,
            formData: getFormData(field),
        },
    };
}
function getFormData(fields, excludeArr = ["text"]) {
    return formFields[fields].map((field) => {
        const entries = Object.entries(field);
        return {
            inputAttributes: makeInputAttributes(entries, excludeArr),
            ...getExcludedKeys(entries, excludeArr),
        };
    });
}
function makeInputAttributes(entries, excludeArr) {
    return entries
        .filter(([key]) => !excludeArr.includes(key))
        .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
        .join(" ");
}
function getExcludedKeys(entries, excludeArr) {
    return Object.fromEntries(entries.filter(([key]) => excludeArr.includes(key)));
}
const NAME_FIELD = {
    type: "text",
    required: true,
    placeholder: "Must be unique",
};
const formFields = {
    PRODUCTS: [
        {
            text: "Product Name",
            name: "p_name",
            autofocus: true,
            ...NAME_FIELD,
        },
    ],
    USERS: [
        {
            text: "Name",
            name: "u_name",
            autofocus: true,
            ...NAME_FIELD,
        },
        {
            text: "Username",
            name: "username",
            ...NAME_FIELD,
        },
        {
            text: "Password",
            name: "password",
            type: "password",
            placeholder: "8+ch, 1 lower, 1 upper, 1 digit, 1 special",
            required: true,
        },
        {
            text: "Confirm Password",
            name: "passwordConfirm",
            type: "password",
            placeholder: "Must match above",
            required: true,
        },
    ],
};
