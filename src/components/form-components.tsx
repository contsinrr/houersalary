import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IncomeInput } from '../types';

interface FormProps {
  title: string;
  description?: string;
  onNext?: (data: any) => void;
  defaultData: any;
  validationSchema?: (data: any) => Record<string, string>;
  children: React.ReactNode;
}

function FormLayout({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="form-card"
    >
      <h2 className="form-title">{title}</h2>
      {description && <p className="form-description">{description}</p>}
      {children}
    </motion.div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required,
  suffix,
  min,
  max,
  step
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="form-label-required" />}
      </label>
      <div className="input-with-suffix">
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          className={error ? 'form-input error' : 'form-input'}
          required={required}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  min,
  max,
  step,
  suffix
}: NumberFieldProps) {
  return (
    <InputField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type="number"
      placeholder={placeholder}
      error={error}
      required={required}
      min={min}
      max={max}
      step={step}
      suffix={suffix}
    />
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="form-label-required" />}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'form-input error' : 'form-input'}
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export { FormLayout, InputField, NumberField, SelectField };
