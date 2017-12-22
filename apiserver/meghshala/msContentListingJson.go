package meghshala

type Coursekit struct {
	ID          int64    `json:"id"`           // 639
	Chapter     string   `json:"chapter"`      // U13
	CourseID    int64    `json:"course_id"`    // 701
	CourseName  string   `json:"course_name"`  // Science 06
	FilterTitle string   `json:"filter_title"` // SPEED AND VELOCITY
	Grade       string   `json:"grade"`        // Grade 6
	Language    string   `json:"language"`     // ENGLISH
	Lesson      string   `json:"lesson"`       // L2
	Semester    string   `json:"semestor"`     // S2
	Size        string   `json:"size"`         // 4.97 MB
	Subject     string   `json:"subject"`      // SCI
	SubjectCode string   `json:"subject_code"` // IND-SCI06
	Subtopics   []string `json:"subtopics"`    // Average speed
	TeachkitID  int64    `json:"teachkitID"`   // 5404
	Title       string   `json:"title"`        // G6_S2_SCI_U13_L2_SPEED+AND+VELOCITY_ENGLISH
	Unit        string   `json:"unit"`         // U13
}

type ContentJson struct {
	ResourceList []Coursekit `json:"resource_list"` // <nil>
	Status       int64       `json:"status"`        // 1
	TeachkitList []Coursekit `json:"teachkit_list"`
}

// Map for ID to Filename
type TeachkitIdMap map[int64]string

// Map for XXXX to filename_XXXX.data in directory
// A filename is like: G6_S2_SCI_U13_L2_SPEED+AND+VELOCITY_ENGLISH_XXXX.data
type FileIdMap map[int64]string
