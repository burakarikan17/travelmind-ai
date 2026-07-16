import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tripFormSchema } from '../lib/tripSchema'
import { INTEREST_OPTIONS, CURRENCY_OPTIONS } from '../lib/constants'
import { generateTripPlan } from '../services/tripService'

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
    <div className="max-w-xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Yeni Seyahat Planı Oluştur</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Şehir / Ülke</label>
          <input
            type="text"
            placeholder="Örn: Roma, İtalya"
            {...register('destination')}
            className="w-full border p-2 rounded"
          />
          {errors.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full border p-2 rounded"
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gün Sayısı</label>
            <input
              type="number"
              {...register('durationDays', { valueAsNumber: true })}
              className="w-full border p-2 rounded"
            />
            {errors.durationDays && (
              <p className="text-red-500 text-sm mt-1">{errors.durationDays.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kişi Sayısı</label>
            <input
              type="number"
              {...register('peopleCount', { valueAsNumber: true })}
              className="w-full border p-2 rounded"
            />
            {errors.peopleCount && (
              <p className="text-red-500 text-sm mt-1">{errors.peopleCount.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bütçe</label>
            <input
              type="number"
              placeholder="Örn: 15000"
              {...register('budget', { valueAsNumber: true })}
              className="w-full border p-2 rounded"
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Para Birimi</label>
            <select {...register('currency')} className="w-full border p-2 rounded">
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">İlgi Alanları</label>
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
                      onClick={() => {
                        if (selected) {
                          field.onChange(field.value.filter((v) => v !== opt.value))
                        } else {
                          field.onChange([...field.value, opt.value])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.interests && (
            <p className="text-red-500 text-sm mt-1">{errors.interests.message}</p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm">
            {mutation.error?.response?.data?.message || 'Plan oluşturulurken bir hata oluştu.'}
          </p>
        )}

        {mutation.isPending && (
          <p className="text-blue-600 text-sm">
            Planınız oluşturuluyor, bu işlem yer doğrulaması nedeniyle biraz sürebilir...
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white p-2.5 rounded font-medium disabled:opacity-50"
        >
          {mutation.isPending ? 'Plan Oluşturuluyor...' : 'Plan Oluştur'}
        </button>
      </form>

      {mutation.isSuccess && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-medium">✅ Plan başarıyla oluşturuldu! (Konsolu kontrol et)</p>
        </div>
      )}
    </div>
  )
}