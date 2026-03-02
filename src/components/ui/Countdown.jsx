import { useState, useEffect } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { WEDDING_DATE } from '../../utils/constants'

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const now = new Date()
    const target = WEDDING_DATE

    if (now >= target) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

    const days = differenceInDays(target, now)
    const hours = differenceInHours(target, now) % 24
    const minutes = differenceInMinutes(target, now) % 60
    const seconds = differenceInSeconds(target, now) % 60

    return { days, hours, minutes, seconds }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const units = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' }
  ]

  return (
    <div className="flex gap-4 justify-center">
      {units.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="bg-dark text-gold font-bold text-3xl md:text-4xl rounded-xl w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-lg">
            {String(value).padStart(2, '0')}
          </div>
          <p className="text-text-light text-sm mt-2">{label}</p>
        </div>
      ))}
    </div>
  )
}
