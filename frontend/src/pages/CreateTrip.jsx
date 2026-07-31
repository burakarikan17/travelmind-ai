import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { tripFormSchema } from "../lib/tripSchema";
import { generateTripPlan } from "../services/tripService";
import Spinner from "../components/Spinner";
import { useState, useRef, useEffect } from "react";
import { searchDestinations } from "../services/placeSearchService";
import RecentTrips from '../components/RecentTrips';
import {
  INTEREST_OPTIONS,
  CURRENCY_OPTIONS,
  AUTO_INTEREST_VALUE,
} from "../lib/constants";
import {
  cardClass,
  fieldErrorClass,
  inputClass,
  inputErrorClass,
  labelClass,
  primaryButtonClass,
} from "../lib/uiClasses";

/* Hata durumunda input'un kenarlığını kırmızıya çevirir */
function fieldClass(hasError) {
  return hasError ? `${inputClass} ${inputErrorClass}` : inputClass;
}

export default function CreateTrip() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      startDate: "",
      durationDays: 3,
      budget: undefined,
      currency: "TRY",
      peopleCount: 1,
      interests: [],
    },
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const destinationValue = watch("destination");

  useEffect(() => {
    // Önceki bekleyen aramayı iptal et
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!destinationValue || destinationValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Kullanıcı yazmayı bitirdikten 400ms sonra ara (debounce)
    debounceRef.current = setTimeout(async () => {
      const results = await searchDestinations(destinationValue);
      setSuggestions(results);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [destinationValue]);

  function handleSuggestionClick(label) {
    setValue("destination", label);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const mutation = useMutation({
    mutationFn: generateTripPlan,
    onSuccess: (data) => {
      navigate(`/planlar/${data.tripId}`);
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
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

          <div className="relative">
            <label htmlFor="destination" className={labelClass}>
              Şehir / Ülke
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Örn: Roma, İtalya"
              autoComplete="off"
              {...register("destination")}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className={fieldClass(errors.destination)}
            />
            {errors.destination && (
              <p className={fieldErrorClass}>{errors.destination.message}</p>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full rounded-card border border-ink-200 bg-white mt-1 shadow-card-hover max-h-52 overflow-auto">
                {suggestions.map((s, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSuggestionClick(s.label)}
                    className="px-3 py-2 text-sm cursor-pointer text-ink-700 hover:bg-ink-50"
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="startDate" className={labelClass}>
              Başlangıç Tarihi
            </label>
            <input
              id="startDate"
              type="date"
              {...register("startDate")}
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
                {...register("durationDays", { valueAsNumber: true })}
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
                {...register("peopleCount", { valueAsNumber: true })}
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
                {...register("budget", { valueAsNumber: true })}
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
                {...register("currency")}
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
            render={({ field }) => {
              const isAuto =
                field.value.length === 1 &&
                field.value[0] === AUTO_INTEREST_VALUE;

              function toggleAuto() {
                if (isAuto) {
                  field.onChange([]); // otomatik modundan çık, manuel seçime dön
                } else {
                  field.onChange([AUTO_INTEREST_VALUE]); // otomatik moduna geç
                }
              }

              return (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={toggleAuto}
                    className={`self-start text-sm px-3 py-1.5 rounded-full border transition ${
                      isAuto
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                    }`}
                  >
                    ⚡ {isAuto ? "Otomatik Seçildi" : "Otomatik Seç"}
                  </button>

                  {!isAuto && (
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((opt) => {
                        const selected = field.value.includes(opt.value);
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => {
                              if (selected) {
                                field.onChange(
                                  field.value.filter((v) => v !== opt.value),
                                );
                              } else {
                                field.onChange([...field.value, opt.value]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm border transition ${
                              selected
                                ? "bg-brand-700 text-white border-brand-700"
                                : "bg-white text-gray-700 border-gray-300 hover:border-brand-400"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
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
              "Plan oluşturulurken bir hata oluştu."}
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
          {mutation.isPending ? "Plan Oluşturuluyor..." : "Plan Oluştur"}
        </button>
      </form>

       <RecentTrips />

      {mutation.isSuccess && (
        <div className="mt-6 rounded-card border border-success-200 bg-success-50 px-4 py-3">
          <p className="text-sm font-semibold text-success-700">
            ✅ Plan başarıyla oluşturuldu!
          </p>
        </div>
      )}
    </div>
  );
}
