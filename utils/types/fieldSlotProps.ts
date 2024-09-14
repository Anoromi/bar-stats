import type { FieldContext, FieldBindingObject, ComponentFieldBindingObject, FieldMeta } from "vee-validate";

export type FieldSlotProps<TValue = unknown> = Pick<FieldContext, 'validate' | 'resetField' | 'handleChange' | 'handleReset' | 'handleBlur' | 'setTouched' | 'setErrors' | 'setValue'> & {
    field: FieldBindingObject<TValue>;
    componentField: ComponentFieldBindingObject<TValue>;
    value: TValue;
    meta: FieldMeta<TValue>;
    errors: string[];
    errorMessage: string | undefined;
    handleInput: FieldContext['handleChange'];
}
