import { hyperRender } from "./hyper-render";
// Utilities
import { zip } from "../vdom/utils/zip.util";
import { isString } from "../vdom/utils/is-string.util";

const diffProps = (oldProps, newProps) => {
  const patches = [];

  // set new props
  for (const [propKey, propValue] of Object.entries(newProps)) {
    patches.push(($node) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
      if (propKey.startsWith("data")) {
        let propDataKey = propKey.slice(4);
        propDataKey =
          propDataKey.charAt(0).toLowerCase() + propDataKey.slice(1);

        $node.dataset[propDataKey] = propValue;
      } else {
        $node.setAttribute(propKey, propValue);
      }

      return $node;
    });
  }

  // remove old props
  for (const propKey in oldProps) {
    if (!(propKey in newProps)) {
      patches.push(($node) => {
        $node.removeAttribute(propKey);

        return $node;
      });
    }
  }

  return ($node) => {
    for (const patch of patches) {
      patch($node);
    }
  };
};

const diffChildren = (oldChildren, newChildren) => {
  const childPatches = [];
  oldChildren.forEach((oldChild, i) => {
    childPatches.push(diff(oldChild, newChildren[i]));
  });

  const extraPatches = [];
  const extraChildren = newChildren.slice(oldChildren.length);
  for (const extraChild of extraChildren) {
    extraPatches.push(($node) => {
      $node.appendChild(hyperRender(extraChild));

      return $node;
    });
  }

  return ($parent) => {
    const zippedChilds = zip(childPatches, $parent.childNodes);
    for (const [patch, child] of zippedChilds) {
      patch(child);
    }

    for (const patch of extraPatches) {
      patch($parent);
    }

    return $parent;
  };
};

export const diff = (oldNode, newNode) => {
  if (newNode === undefined) {
    return ($node) => {
      $node.remove();

      return;
    };
  }

  if (isString(oldNode) || isString(newNode)) {
    if (oldNode !== newNode) {

      return ($node) => {
        const $newNode = hyperRender(newNode);
        // Replace the current node its new version. God dame it
        $node.replaceWith(newNode);

        return $newNode;
      };
    } else {
      return () => {};
    }
  }

  if (oldNode.type !== newNode.type) {
    return ($node) => {
      const $newNode = hyperRender(newNode);
      $node.replaceWith($newNode);

      return $newNode;
    };
  }

  const patchProps = diffProps(oldNode.props, newNode.props);
  const patchChildren = diffChildren(oldNode.children, newNode.children);

  // Return a function just for applying attrs and children patches
  return ($node) => {
    patchProps($node);
    patchChildren($node);

    return $node;
  };
};
