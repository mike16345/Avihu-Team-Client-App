import React, { useState } from 'react'
import { StyleSheet } from 'react-native';
import { FAB, Portal, PaperProvider } from 'react-native-paper';

const FABGroup = () => {
    const [open, setOpen] = useState(false);

  return (
    <PaperProvider>
        <Portal>
            <FAB.Group
                style={styles.FabContainer}
                open={open}
                visible={true}
                icon={open?`arrow-collapse-down`:`arrow-collapse-up`}
                label='תפריטים'
                actions={[
                    {   icon:`camera-control`,
                        label:`חלבונים`, 
                        onPress:()=>console.log(`חלבונים`)
                    },
                    {   icon:`baguette`,
                        label:`פחמימות`, 
                        onPress:()=>console.log(`פחמימות`)
                    },
                    {   icon:`camera-control`,
                        label:`שומנים`, 
                        onPress:()=>console.log(`שומנים`)
                    },
                    {   icon:`camera-control`,
                        label:`ירקות`, 
                        onPress:()=>console.log(`ירקות`)
                    },
                ]}
                onStateChange={()=>setOpen(!open)}
                onPress={()=>setOpen(!open)}
            />
            <FAB
                style={styles.FabContainer}
                icon="plus"
                onPress={()=>console.log(`aa`)
                }
            />
        </Portal>
    </PaperProvider>
  )
}

const styles=StyleSheet.create({
    FabContainer: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
})

export default FABGroup
