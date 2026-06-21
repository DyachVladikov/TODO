import "./Content.scss"

interface ContentProps {
    children: React.ReactNode
}

const Content = (props:ContentProps) => {

    const {
        children
    } = props
    
    return (
        <>
            {children}
        </>
    )
}

export default Content