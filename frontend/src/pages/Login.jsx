import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Loader from '../components/Loader'
import { loginUser } from '../services/authService'
import { setUser } from '../store/authSlice'
import getErrorMessage from '../utils/getErrorMessage'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { phoneNumber: '', password: '' } })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const user = await loginUser({
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
      })
      dispatch(setUser(user))
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error))
    }
  }

  return (
    <AuthLayout title="लॉगिन करें" subtitle="अपने मोबाइल नंबर और पासवर्ड से अंदर आएं।">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="मोबाइल नंबर"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber', {
            validate: (v) => v.trim().length > 0 || 'मोबाइल नंबर लिखें',
          })}
        />

        <Input
          label="पासवर्ड"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'पासवर्ड लिखें' })}
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
          {isSubmitting ? <Loader label="लॉगिन हो रहा है…" /> : 'लॉगिन करें'}
        </button>
      </form>

      <p className="mt-4 text-center text-base">
        नया खाता बनाना है?{' '}
        <Link to="/register" className="font-semibold text-leaf-700 underline">
          रजिस्टर करें
        </Link>
      </p>
    </AuthLayout>
  )
}
