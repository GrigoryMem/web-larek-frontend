// Преобразует строку из формата PascalCase в kebab-case.
export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}
// Проверяет, является ли значение строкой, длиной больше одного символа.
export function isSelector(x: any): x is string {
    return (typeof x === "string") && x.length > 1;
}
// Возвращает true, если значение null или undefined.
export function isEmpty(value: any): boolean {
    return value === null || value === undefined;
}
// Это тип, который описывает возможные варианты того, что может быть 
// передано в функцию, работающую с HTML-элементами.
export type SelectorCollection<T> = string | NodeListOf<Element> | T[];
// NodeListOf<Element> — результат от document.querySelectorAll()
// string — селектор, например ".card"
// T[] — массив DOM-элементов (HTMLElement[])
// находит элемент разметки в указанном контейнере: если элемента нет выдает ошибку
// context — откуда искать (по умолчанию document).
// Возвращает массив элементов.

// Подходит, если ты хочешь получить все подходящие элементы по селектору (или другой форме).
export function ensureAllElements<T extends HTMLElement>(selectorElement: SelectorCollection<T>, context: HTMLElement = document as unknown as HTMLElement): T[] {
    if (isSelector(selectorElement)) {
        // selectorElement: может быть строкой-селектором, NodeList, или массивом элементов.
        // Если это строка-селектор → используем querySelectorAll для поиска.
        // Array.from(...) превращает NodeList в обычный массив.
        return Array.from(context.querySelectorAll(selectorElement)) as T[];
    }
    if (selectorElement instanceof NodeList) {
        return Array.from(selectorElement) as T[];
        // Если это уже NodeList, просто превращаем в массив.
    }
    if (Array.isArray(selectorElement)) {
        // Если это уже массив — возвращаем как есть.
        return selectorElement;
    }
    // Если ничего из этого — выбрасываем ошибку.
    throw new Error(`Unknown selector element`);
}

export type SelectorElement<T> = T | string;
// selectorElement может быть строкой-селектором или конкретным HTML-элементом. -Возвращает один элемент.
// функция которая позволяет найти любой элемент разметки  - выдает критическую ошибку и останавливает приложение
//  если элемент обязательно должен быть
//  если элемента может не быть - воспользуйся queryS
export function ensureElement<T extends HTMLElement>(selectorElement: SelectorElement<T>, context?: HTMLElement): T {
    if (isSelector(selectorElement)) {
        // Если передана строка — вызываем ensureAllElements, 
        // чтобы получить все подходящие элементы.
        const elements = ensureAllElements<T>(selectorElement, context);
        if (elements.length > 1) {
            // Если найдено больше одного элемента — просто предупреждение (не ошибка).
            console.warn(`selector ${selectorElement} return more then one element`);
        }
        if (elements.length === 0) {
            throw new Error(`selector ${selectorElement} return nothing`);
            // Если не найдено ни одного — ошибка, чтобы программа остановилась.
            //  Это важно, когда элемент обязан быть.
        }
        // Возвращаем последний найденный элемент.
        return elements.pop() as T;
    }
    if (selectorElement instanceof HTMLElement) {
        // Если это сразу DOM-элемент, возвращаем как есть.
        return selectorElement as T;
    }
    throw new Error('Unknown selector element');
    // Возвращает один элемент (или вызывает ошибку, если не найден).
// Используется, если элемент обязан быть на странице.
// Защищает от ошибок, если ты ожидаешь один конкретный элемент.
}

//  создает клон темплейта

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    const template = ensureElement(query) as HTMLTemplateElement;
    return template.content.firstElementChild.cloneNode(true) as T;
}

// Создаёт имя CSS-класса по методологии БЭМ.
// bem("button", "icon", "active")
// => { name: "button__icon_active", class: ".button__icon_active" }
export function bem(block: string, element?: string, modifier?: string): { name: string, class: string } {
    let name = block;
    if (element) name += `__${element}`;
    if (modifier) name += `_${modifier}`;
    return {
        name,
        class: `.${name}`
    };
}

// Возвращает список имен всех методов и 
// свойств объекта (не из самого объекта, а из его прототипа),
//  фильтруя их по условию.
export function getObjectProperties(obj: object, filter?: (name: string, prop: PropertyDescriptor) => boolean): string[] {
    return Object.entries(
        Object.getOwnPropertyDescriptors(
            Object.getPrototypeOf(obj)
        )
    )
        .filter(([name, prop]: [string, PropertyDescriptor]) => filter ? filter(name, prop) : (name !== 'constructor'))
        .map(([name, prop]) => name);
}

/**
 * Устанавливает dataset атрибуты элемента
 */
export function setElementData<T extends Record<string, unknown> | object>(el: HTMLElement, data: T) {
    for (const key in data) {
        el.dataset[key] = String(data[key]);
        // setElementData(div, { id: 123, role: "admin" });
// результат: <div data-id="123" data-role="admin">
    }
}

/**
 * Получает типизированные данные из dataset атрибутов элемента
 */
export function getElementData<T extends Record<string, unknown>>(el: HTMLElement, scheme: Record<string, Function>): T {
    const data: Partial<T> = {};
    for (const key in el.dataset) {
        data[key as keyof T] = scheme[key](el.dataset[key]);
    }
    return data as T;
}

/**
 * Проверка на простой объект Проверяет, что объект — "простой" ({}), а не класс, массив, дата и т.д.
 */
export function isPlainObject(obj: unknown): obj is object {
    const prototype = Object.getPrototypeOf(obj);
    return  prototype === Object.getPrototypeOf({}) ||
        prototype === null;
}
// Проверяет, является ли значение булевым (true или false).    
export function isBoolean(v: unknown): v is boolean {
    return typeof v === 'boolean';
}

/**
 * Фабрика DOM-элементов в простейшей реализации
 * здесь не учтено много факторов
 * в интернет можно найти более полные реализации
 */
// Создаёт HTML-элемент, задаёт ему свойства, добавляет детей.
// tagName — имя тега (например, 'div', 'button')

// props — свойства элемента (например, id, checked, dataset)

// children — внутрь можно положить другие элементы (например, текст, картинку)
export function createElement<
    T extends HTMLElement
    >(
    tagName: keyof HTMLElementTagNameMap,
    props?: Partial<Record<keyof T, string | boolean | object>>,
    children?: HTMLElement | HTMLElement []
): T {
    const element = document.createElement(tagName) as T;
    if (props) {
        for (const key in props) {
            const value = props[key];
            // «Если value — это объект,
            //  и key — это 'dataset', то вызвать setElementData(element, value)»
            // пример
            // {
            //     id: 'block',
            //     hidden: true,
            //     dataset: {
            //       userId: 123,
            //       role: 'admin'
            //     }
            //   }
            if (isPlainObject(value) && key === 'dataset') {
                setElementData(element, value);
            } else {
                // @ts-expect-error fix indexing later
                element[key] = isBoolean(value) ? value : String(value);
            }
        }
    }
    if (children) {
        for (const child of Array.isArray(children) ? children : [children]) {
            element.append(child);
        }
    }
    return element;


}



