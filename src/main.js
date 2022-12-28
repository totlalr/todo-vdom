// Virtual DOM Utilities
import { createElement } from "./vdom/createElement";
import { hyperRender } from "./vdom/hyper-render";
import { mount } from "./vdom/mount";
import { diff } from "./vdom/diff";

document.getElementById("btn").addEventListener("click", (e) => {
  e.preventDefault();
  const input = document.getElementById("txt");

  const AppTree = (name) =>
    createElement("div", {
      props: {
        id: `${Math.random().toString(16).slice(2)}`,
        class: "add-to-do",
      },
      children: [
        `${name}`,
        createElement("div", {
          props: {
            id: "icon",
          },
          children: [
            createElement("span", {
              props: {
                id: "checked",
                class: "material-symbols-outlined checked",
              },
              children: ["done"],
            }),
            createElement("span", {
              props: {
                id: "del",
                class: "material-symbols-outlined del",
              },
              children: ["close"],
            }),
          ],
        }),
      ],
    });

  let AppTreeElm = AppTree(name);
  const $app = hyperRender(AppTreeElm);
  const appElm = document.getElementById("app");
  let $rootEl = mount($app, appElm);

  name = input.value;
  input.focus();
  input.value = "";

  const newAppElm = AppTree(name);
  const patch = diff(AppTreeElm, newAppElm);
  $rootEl = patch($rootEl);
  AppTreeElm = newAppElm;

  const del = document.getElementById("del");
  console.log(del, "del");
  del.addEventListener("click", () => {
    const parent = document.getElementById("del").parentElement.parentElement;
    console.log(parent, "parent");
    parent.remove();
  });

  const checked = document.getElementById("checked");
  checked.addEventListener("click", () => {
    const span = checked.parentElement.parentElement;
    span.classList.toggle("done");
  });
});
