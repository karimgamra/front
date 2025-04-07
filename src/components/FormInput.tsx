type FormProps = {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  size?: string;
};

const FormInput: React.FC<FormProps> = ({
  label,
  name,
  type,
  defaultValue,
  size = "w-full",
}) => {
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className="label-text capitalize">{label}</span>
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered ${size}`}
      />
    </div>
  );
};

export default FormInput;
