import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Loader from '../components/Loader'
import { loginUser, registerUser } from '../services/authService'
import { setUser } from '../store/authSlice'
import getErrorMessage from '../utils/getErrorMessage'

// These limits match the backend (RegisterRequest / User model), measured after trimming spaces.
const lengthBetween = (min, max, tooShort, tooLong) => (value) => {
  const length = (value ?? '').trim().length
  if (length < min) return tooShort
  if (length > max) return tooLong
  return true
}

// Optional fields: empty is fine, otherwise the same length rules apply.
const optionalLength = (min, max, tooShort, tooLong) => (value) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return true
  return lengthBetween(min, max, tooShort, tooLong)(trimmed)
}

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      phoneNumber: '',
      fullname: '',
      password: '',
      city: '',
      state: '',
      country: '',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')

    const payload = {
      phoneNumber: values.phoneNumber.trim(),
      fullname: values.fullname.trim(),
      password: values.password,
    }
    // Optional fields are left out when empty (the backend rejects empty strings).
    for (const field of ['city', 'state', 'country']) {
      const value = values[field].trim()
      if (value) payload[field] = value
    }

    try {
      await registerUser(payload)
    } catch (error) {
      setServerError(getErrorMessage(error))
      return
    }

    // Registering does not log in, so sign in right away with the same details.
    try {
      const user = await loginUser({
        phoneNumber: payload.phoneNumber,
        password: payload.password,
      })
      dispatch(setUser(user))
      navigate('/', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthLayout title="नया खाता बनाएं" subtitle="कुछ जानकारी भरें, फिर आप तुरंत शुरू कर सकते हैं।">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="मोबाइल नंबर"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber', {
            validate: (v) => {
              const value = v.trim()
              if (!/^\+?\d+$/.test(value)) return 'सिर्फ़ अंक लिखें (शुरू में + चल सकता है)'
              return lengthBetween(
                8,
                16,
                'मोबाइल नंबर कम से कम 8 अंकों का हो',
                'मोबाइल नंबर 16 अंकों से ज़्यादा नहीं हो सकता',
              )(value)
            },
          })}
        />

        <Input
          label="पूरा नाम"
          autoComplete="name"
          error={errors.fullname?.message}
          {...register('fullname', {
            validate: lengthBetween(
              3,
              100,
              'नाम कम से कम 3 अक्षरों का हो',
              'नाम 100 अक्षरों से ज़्यादा नहीं हो सकता',
            ),
          })}
        />

        <Input
          label="पासवर्ड"
          type="password"
          autoComplete="new-password"
          hint="कम से कम 8 अक्षर"
          error={errors.password?.message}
          {...register('password', {
            validate: (v) => {
              if (v.length < 8) return 'पासवर्ड कम से कम 8 अक्षरों का हो'
              // bcrypt can only use the first 72 bytes; Hindi letters take 3 bytes each
              if (new TextEncoder().encode(v).length > 72) {
                return 'पासवर्ड बहुत लंबा है। छोटा पासवर्ड चुनें।'
              }
              return true
            },
          })}
        />

        <Input
          label="शहर (वैकल्पिक)"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city', {
            validate: optionalLength(1, 100, '', 'शहर का नाम 100 अक्षरों से ज़्यादा नहीं हो सकता'),
          })}
        />

        <Input
          label="राज्य (वैकल्पिक)"
          autoComplete="address-level1"
          error={errors.state?.message}
          {...register('state', {
            validate: optionalLength(
              3,
              100,
              'राज्य का नाम कम से कम 3 अक्षरों का हो',
              'राज्य का नाम 100 अक्षरों से ज़्यादा नहीं हो सकता',
            ),
          })}
        />

        <Input
          label="देश (वैकल्पिक)"
          autoComplete="country-name"
          error={errors.country?.message}
          {...register('country', {
            validate: optionalLength(
              3,
              100,
              'देश का नाम कम से कम 3 अक्षरों का हो',
              'देश का नाम 100 अक्षरों से ज़्यादा नहीं हो सकता',
            ),
          })}
        />

        {serverError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-base font-medium text-red-700">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-leaf-700 text-lg font-semibold text-white hover:bg-leaf-600
            disabled:opacity-60 focus-visible:outline-4 focus-visible:outline-offset-2
            focus-visible:outline-wheat-400"
        >
          {isSubmitting ? <Loader label="खाता बन रहा है…" /> : 'रजिस्टर करें'}
        </button>
      </form>

      <p className="mt-4 text-center text-base">
        पहले से खाता है?{' '}
        <Link to="/login" className="font-semibold text-leaf-700 underline">
          लॉगिन करें
        </Link>
      </p>
    </AuthLayout>
  )
}
