import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tripFormSchema } from '../lib/tripSchema'
import { INTEREST_OPTIONS, CURRENCY_OPTIONS } from '../lib/constants'
import { generateTripPlan } from '../services/tripService'
import Spinner from '../components/Spinner'
import {
  cardClass,
  fieldErrorClass,
  inputClass,
  inputErrorClass,
  labelClass,
  primaryButtonClass,
} from '../lib/uiClasses'

/* Hata durumunda input'un kenarlığını kırmızıya çevirir */
function fieldClass(hasError) {
  return hasError ? `${inputClass} ${inputErrorClass}` : inputClass
}

export default function CreateTrip() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: '',
      startDate: '',
      durationDays: 3,
      budget: undefined,
      currency: 'TRY',
      peopleCount: 1,
      interests: [],
    },
  })

  const mutation = useMutation({
    mutationFn: generateTripPlan,
    onSuccess: (data) => {
      navigate(`/planlar/${data.tripId}`)
    },
  })

  function onSubmit(data) {
    mutation.mutate(data)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-h1 text-ink-900">Yeni Seyahat Planı Oluştur</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Birkaç detay paylaş, gerisini yapay zeka halletsin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* --- Rota --- */}
        <section className={`${cardClass} flex flex-col gap-5 p-5 sm:p-6`}>
          <h2 className="text-label uppercase tracking-wide text-ink-400">
            Rota
          </h2>

          <div>
            <label htmlFor="destination" className={labelClass}>
              Şehir / Ülke
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Örn: Roma, İtalya"
              {...register('destination')}
              className={fieldClass(errors.destination)}
            />
            {errors.destination && (
              <p className={fieldErrorClass}>{errors.destination.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="startDate" className={labelClass}>
              Başlangıç Tarihi
            </label>
            <input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={fieldClass(errors.startDate)}
            />
            {errors.startDate && (
              <p className={fieldErrorClass}>{errors.startDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="durationDays" className={labelClass}>
                Gün Sayısı
              </label>
              <input
                id="durationDays"
                type="number"
                {...register('durationDays', { valueAsNumber: true })}
                className={fieldClass(errors.durationDays)}
              />
              {errors.durationDays && (
                <p className={fieldErrorClass}>{errors.durationDays.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="peopleCount" className={labelClass}>
                Kişi Sayısı
              </label>
              <input
                id="peopleCount"
                type="number"
                {...register('peopleCount', { valueAsNumber: true })}
                className={fieldClass(errors.peopleCount)}
              />
              {errors.peopleCount && (
                <p className={fieldErrorClass}>{errors.peopleCount.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* --- Bütçe --- */}
        <section className={`${cardClass} flex flex-col gap-5 p-5 sm:p-6`}>
          <h2 className="text-label uppercase tracking-wide text-ink-400">
            Bütçe
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="budget" className={labelClass}>
                Bütçe
              </label>
              <input
                id="budget"
                type="number"
                placeholder="Örn: 15000"
                {...register('budget', { valueAsNumber: true })}
                className={fieldClass(errors.budget)}
              />
              {errors.budget && (
                <p className={fieldErrorClass}>{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className={labelClass}>
                Para Birimi
              </label>
              <select
                id="currency"
                {...register('currency')}
                className={`${inputClass} sm:w-32`}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* --- İlgi alanları --- */}
        <section className={`${cardClass} flex flex-col gap-4 p-5 sm:p-6`}>
          <div>
            <h2 className="text-label uppercase tracking-wide text-ink-400">
              İlgi Alanları
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Planı sana göre şekillendirmek için birden fazla seçebilirsin.
            </p>
          </div>

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = field.value.includes(opt.value)
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      aria-pressed={selected}
                      onClick={() => {
                        if (selected) {
                          field.onChange(field.value.filter((v) => v !== opt.value))
                        } else {
                          field.onChange([...field.value, opt.value])
                        }
                      }}
                      className={[
                        'rounded-full border px-3.5 py-1.5 text-sm font-semibold outline-none transition-all',
                        'active:translate-y-px',
                        'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                        selected
                          ? 'border-brand-700 bg-brand-700 text-white shadow-card hover:bg-brand-800'
                          : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.interests && (
            <p className={fieldErrorClass}>{errors.interests.message}</p>
          )}
        </section>

        {mutation.isError && (
          <p
            role="alert"
            className="rounded-btn border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm font-medium text-danger-700"
          >
            {mutation.error?.response?.data?.message ||
              'Plan oluşturulurken bir hata oluştu.'}
          </p>
        )}

        {mutation.isPending && (
          <div className="flex items-start gap-3 rounded-btn border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900">
            <Spinner className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            <p>
              Planınız oluşturuluyor, bu işlem yer doğrulaması nedeniyle biraz
              sürebilir...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`${primaryButtonClass} py-3 text-base`}
        >
          {mutation.isPending && <Spinner />}
          {mutation.isPending ? 'Plan Oluşturuluyor...' : 'Plan Oluştur'}
        </button>
      </form>

      {mutation.isSuccess && (
        <div className="mt-6 rounded-card border border-success-200 bg-success-50 px-4 py-3">
          <p className="text-sm font-semibold text-success-700">
            ✅ Plan başarıyla oluşturuldu!
          </p>
        </div>
      )}
    </div>
  )
}
