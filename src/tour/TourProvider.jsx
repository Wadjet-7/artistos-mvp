import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useAuth } from "../context/AuthContext"
import { MISSIONS, MISSION_ORDER } from "./missions"
import { tourOn } from "./tourEvents"

const TourContext = createContext(null)

export function useTour() {
  return useContext(TourContext)
}

function waitForElement(selector, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector)
    if (el) { resolve(el); return }

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector)
      if (found) { observer.disconnect(); resolve(found) }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    setTimeout(() => { observer.disconnect(); resolve(null) }, timeoutMs)
  })
}

export function TourProvider({ children }) {
  const { user, updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentMission, setCurrentMission] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const driverRef = useRef(null)

  const progress = user?.onboarding_progress || {}
  const missions = progress.missions || {}

  const saveMissionState = useCallback(async (missionId, state) => {
    if (!user?.id) return
    const newProgress = {
      ...progress,
      missions: { ...missions, [missionId]: state },
    }
    try {
      await updateUser({ onboarding_progress: newProgress })
    } catch { /* silent */ }
  }, [user?.id, progress, missions, updateUser])

  const startMission = useCallback((missionId) => {
    const mission = MISSIONS[missionId]
    if (!mission) return

    setCurrentMission(missionId)
    setCurrentStep(0)

    const totalSteps = mission.steps.length

    const steps = mission.steps.map((step, i) => ({
      element: step.target,
      popover: {
        title: step.title,
        description: step.body,
        side: "bottom",
        align: "start",
        showButtons: ["next", "close"],
        nextBtnText: i === totalSteps - 1 ? "Done" : "Next",
        doneBtnText: "Done",
        closeBtnText: "Skip",
        onNextClick: async () => {
          const d = driverRef.current
          if (!d) return

          if (step.advanceOn?.startsWith("route:")) {
            const path = step.advanceOn.replace("route:", "")
            navigate(path)
            await waitForElement(mission.steps[i + 1]?.target || "body")
          }

          if (i === totalSteps - 1) {
            d.destroy()
            saveMissionState(missionId, "done")
            setCurrentMission(null)
          } else {
            d.moveNext()
          }
        },
        onCloseClick: () => {
          const d = driverRef.current
          if (d) d.destroy()
          setCurrentMission(null)
        },
      },
    }))

    const d = driver({
      showProgress: true,
      steps,
      animate: true,
      overlayColor: "rgba(14, 12, 10, 0.6)",
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "artistos-tour-popover",
      onDestroyed: () => {
        setCurrentMission(null)
      },
    })

    driverRef.current = d

    setTimeout(async () => {
      const firstTarget = mission.steps[0]?.target
      if (firstTarget) {
        const el = await waitForElement(firstTarget)
        if (!el) return
      }
      try { d.drive() } catch { /* element not found, skip */ }
    }, 500)
  }, [navigate, saveMissionState])

  // Listen for tour events and auto-advance when an event matches
  useEffect(() => {
    const unsub = tourOn("*", (eventName) => {
      const d = driverRef.current
      if (!d || !currentMission) return

      const mission = MISSIONS[currentMission]
      if (!mission) return

      const activeIdx = d.getActiveIndex?.() ?? currentStep
      const step = mission.steps[activeIdx]
      if (!step) return

      if (step.advanceOn === `event:${eventName}`) {
        if (activeIdx === mission.steps.length - 1) {
          d.destroy()
          saveMissionState(currentMission, "done")
          setCurrentMission(null)
        } else {
          d.moveNext()
        }
      }
    })
    return unsub
  }, [currentMission, currentStep, saveMissionState])

  const skipMission = useCallback((missionId) => {
    saveMissionState(missionId, "skipped")
    if (driverRef.current) driverRef.current.destroy()
    setCurrentMission(null)
  }, [saveMissionState])

  const exitTour = useCallback(() => {
    if (driverRef.current) driverRef.current.destroy()
    setCurrentMission(null)
  }, [])

  const isMissionDone = useCallback((missionId) => {
    return missions[missionId] === "done" || missions[missionId] === "skipped"
  }, [missions])

  const value = {
    startMission,
    skipMission,
    exitTour,
    currentMission,
    isMissionDone,
    missions,
    progress,
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}
