import { createContext, useContext, useState, useCallback, useEffect } from "react"
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

export function TourProvider({ children }) {
  const { user, updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentMission, setCurrentMission] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [driverInstance, setDriverInstance] = useState(null)

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

    const steps = mission.steps.map((step, i) => ({
      element: step.target,
      popover: {
        title: step.title,
        description: step.body,
        side: "bottom",
        align: "start",
        showButtons: ["next", "close"],
        nextBtnText: i === mission.steps.length - 1 ? "Done" : "Next",
        doneBtnText: "Done",
        closeBtnText: "Exit tour",
        onNextClick: () => {
          if (step.advanceOn?.startsWith("route:")) {
            const path = step.advanceOn.replace("route:", "")
            navigate(path)
          }
          d.moveNext()
        },
        onCloseClick: () => {
          d.destroy()
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
        saveMissionState(missionId, "done")
        setCurrentMission(null)
      },
    })

    setDriverInstance(d)

    setTimeout(() => {
      try { d.drive() } catch { /* element not found, skip */ }
    }, 500)
  }, [navigate, saveMissionState])

  const skipMission = useCallback((missionId) => {
    saveMissionState(missionId, "skipped")
    if (driverInstance) driverInstance.destroy()
    setCurrentMission(null)
  }, [driverInstance, saveMissionState])

  const exitTour = useCallback(() => {
    if (driverInstance) driverInstance.destroy()
    setCurrentMission(null)
  }, [driverInstance])

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
