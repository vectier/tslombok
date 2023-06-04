/**
 * A property decorator to create a getter method automatically.
 * A getter method returns the property, and is named `getFoo` if the property is called `foo`.
 */
export function Getter(...params: Parameters<PropertyDecorator>): void;

/**
 * A property decorator to create a setter method automatically.
 * A setter method is named `setFoo` if the property is called `foo`, returns void,
 * and takes 1 parameter of the same type as the property to set the field to the given value.
 */
export function Setter(...params: Parameters<PropertyDecorator>): void;

/**
 * For TSLombok generated output
 */
import './generated';

